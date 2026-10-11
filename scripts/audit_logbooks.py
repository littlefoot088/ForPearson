"""Reproduce Eimhin's bounded raw-log review; no external packages required.
Usage: python3 scripts/audit_logbooks.py /path/to/carrowmore-data-pack.zip
"""
import csv, io, json, re, sys, zipfile, hashlib
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

PREFIX = 'carrowmore-data-pack/'
# Reviewed activity families, not activity_type/skill_tags or general keyword counts.
FAMILIES = {
 'pump': ('Mechanical seal gone', 'Repacked the gland', 'Pump losing prime', 'Rebuilt the no', 'Cleared a blockage in the suction strainer'),
 'electrical': ('Charger float voltage set wrong', 'Reconfigured distribution', 'Rewired the changeover', 'Rebuilt the changeover logic', 'Traced the nuisance low-volt', 'Traced and lifted an earth fault', 'Re-terminated', 'AVR on', 'Balanced loads', 'Set up the auto-start', 'Synchronised', 'Discrimination not right', 'Set up a duty/standby'),
 'safety': ('Planned the entry into the flooded sump', 'Acted as issuing authority'),
}
def category(text):
 for group, prefixes in FAMILIES.items():
  if text.startswith(prefixes) and (group != 'pump' or not text.startswith('Rebuilt') or 'pump' in text): return group
 return None

def normal_date(raw):
 if re.fullmatch(r'\d{8}', raw): return datetime.strptime(raw,'%Y%m%d').date().isoformat()
 if re.fullmatch(r'\d{5}', raw): return (datetime(1899,12,30)+timedelta(days=int(raw))).date().isoformat()
 if re.fullmatch(r'\d{4}-\d\d-\d\d',raw): return raw
 a,b,y=map(int,raw.split('/'))
 if a<=12 and b<=12 and a!=b: return str(y) # Never guess day/month in mixed-format source.
 return datetime(y,b,a).date().isoformat() if a>12 or a==b else datetime(y,a,b).date().isoformat()

def run(path):
 z=zipfile.ZipFile(path); matched=[]; scanned=Counter(); surname_ocr=0
 lh=json.loads(z.read(PREFIX+'raw/training/vendor-c-learnhub-2017-2026.json'))['records']
 pairs={(r.get('keeper_code'),str(r.get('employee_ref','')).lstrip('0')) for r in lh if r.get('employee_ref')}
 assert {code for code,payroll in pairs if payroll=='12801'}=={'K0104'}
 for name in z.namelist():
  if '/raw/logbooks/' not in name or name.endswith('/'): continue
  source=name.removeprefix(PREFIX); text=z.read(name).decode('cp1252' if name.endswith('.DAT') else 'utf-8-sig')
  scanned['files']+=1
  if name.endswith('.txt'):
   scanned['ocrFiles']+=1
   surname_ocr+=sum(bool(re.search('neidhe',line,re.I)) for line in text.splitlines())
   continue # No reliably attributable Eimhin identity found on review; surname-only is insufficient.
  if name.endswith('.DAT'):
   rows=[]
   for line in text.splitlines():
    p=line.split('|')
    if len(p)!=8 or not p[0].isdigit():continue
    scanned['structuredRows']+=1
    if p[3]=='K0104':rows.append((p[1],p[2],p[3],p[6],p[0],line))
  else:
   rows=[]
   for i,r in enumerate(csv.DictReader(io.StringIO(text)),1):
    scanned['structuredRows']+=1
    ident=r.get('keeper_id',r.get('Keeper Name',''))
    try: payroll=float(ident)==12801
    except ValueError:payroll=False
    if ident=='Eimhin Mac Neidhe' or payroll:
     rows.append((r.get('date',r.get('Date')),r.get('station_code',r.get('Station')),ident,r.get('description',r.get('Activity')),f'Data row {i} (header excluded)',r))
  for rawdate,station,ident,original,locator,raw in rows:
   matched.append(dict(source=source,recordId=locator,rawDate=rawdate,date=normal_date(rawdate),station=station,personRef=ident,original=original,rawRecord=raw))
 grouped={k:[] for k in FAMILIES}
 for r in matched:
  group=category(r['original'])
  if not group:continue
  r=dict(r,id='audit_'+hashlib.sha256((r['source']+r['recordId']).encode()).hexdigest()[:12],highlight=r['original'])
  r['interpretation']='Records '+{'pump':'pump repair or maintenance work.','electrical':'electrical fault correction or control-system work.','safety':'entry planning or permit-issuing responsibility.'}[group]
  if len(r['date'])==4:r['dateNote']='The slash-format date is ambiguous; the year is known. Original date: '+r['rawDate']+'.'
  if re.search(r'(delivery back up to|set the drip and ran up to|volts set to).*\b(V|bar)\.',r['original']) and (('pump' in r['original'] and ' V.' in r['original']) or 'volts set to' in r['original']):
   r['measurementNote']='The recorded measurement has an inconsistent unit; do not use it as proof of the repair result.'
  if r['original'].startswith('Re-terminated') and re.search(r'\b(psi|ohm) before',r['original']):r['measurementNote']='The recorded test measurement needs checking; retain the work description without validating that result.'
  grouped[group].append(r)
 for rows in grouped.values():rows.sort(key=lambda r:(r['date'],r['recordId']))
 appraisals=[json.loads(l) for l in z.read(PREFIX+'raw/appraisals/appraisals.jsonl').decode().splitlines()]
 appraisals=[r for r in appraisals if r.get('keeper_code')=='K0104' or r.get('keeper_name')=='Eimhin Mac Neidhe']
 result=dict(scope='All supplied raw logbook files; exact keeper code, full name or linked payroll reference. OCR surname matches are not attributed.',scanned=dict(scanned),matchedLogCount=len(matched),payrollLinkRecords=sum(r.get('keeper_code')=='K0104' and r.get('employee_ref')=='0012801' for r in lh),groups=grouped,appraisals=appraisals)
 Path('src/evidence-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 for k,rs in grouped.items(): print(k,len(rs),dict(sorted(Counter(r['date'][:4] for r in rs).items())), 'latest',rs[-1]['date'])
 print('scanned',dict(scanned),'matched',len(matched),'appraisals',len(appraisals))
if __name__=='__main__':run(sys.argv[1])

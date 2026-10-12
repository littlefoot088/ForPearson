import test from 'node:test';
import assert from 'node:assert/strict';
import { initialWorkspace, workspaceReducer as reduce, loadWorkspace, persistWorkspace, createReferral } from '../src/workspace.js';
import { peopleForWorkspace, filterPeople, profileHash, profileIdForHash } from '../src/people.js';
import { introductionVersion } from '../src/workflowState.js';
const eimhin = (state) => peopleForWorkspace(state).find((p) => p.currentPerson);
test('undecided intentions require follow-up and block new placements while preserving earlier selections', () => {
  let s = initialWorkspace();
  const id = 'K0147';
  const keeper = () => peopleForWorkspace(s).find((p) => p.id === id);
  assert.equal(keeper().opportunities.length, 0);
  assert.equal(keeper().consideredOpportunities.length, 2);
  assert.match(keeper().intentionFollowup, /questionnaire/);
  assert.equal(filterPeople(peopleForWorkspace(s), 'Coilean', null, true).length, 1);
  assert.equal(reduce(s, {type:'keeper-opportunity-add', id, opportunityId:'array-om'}), s);
  s = reduce(s, {type:'keeper-context-save', id, intention:'Seeking employment', preferences:''});
  assert.equal(keeper().opportunities.length, 2);
  s = reduce(s, {type:'keeper-opportunity-add', id, opportunityId:'array-om'});
  assert.equal(keeper().opportunities.length, 3);
  s = reduce(s, {type:'keeper-context-save', id, intention:'Not yet decided', preferences:''});
  let stored; persistWorkspace({setItem:(_,v)=>stored=v}, {workspace:s,drafts:[],recordFlags:[]});
  s = loadWorkspace({getItem:()=>stored}).workspace;
  assert.equal(keeper().opportunities.length, 0);
  assert.equal(keeper().consideredOpportunities.length, 3);
});
test('profile edits and selections preserve assessment, notes, preferences and exact sent snapshots', () => {
  let s = initialWorkspace();
  s = reduce(s, {type:'opportunity',action:{type:'assessment',value:'worth-discussing'}});
  s = reduce(s, {type:'referral-save',referral:createReferral()});
  s = reduce(s, {type:'simulate-send',approved:true,version:introductionVersion(s.referral)});
  s.notes = [{id:'note',date:'2026-10-01',text:'Private conversation',followup:''}];
  s.workingPreferences = {date:'2026-10-01',response:'Prefer shore work',concerns:''};
  const before = structuredClone(s);
  const id = eimhin(s).id;
  s = reduce(s,{type:'keeper-context-save',id,intention:'Seeking employment',preferences:'Interested in maintenance work.'});
  s = reduce(s,{type:'keeper-opportunity-add',id,opportunityId:'survey'});
  assert.equal(eimhin(s).opportunities.length,4);
  assert.equal(eimhin(s).opportunities.at(-1).progress,'To do');
  assert.equal(eimhin(s).opportunities.at(-1).implemented,undefined);
  assert.equal(reduce(s,{type:'keeper-opportunity-add',id,opportunityId:'survey'}),s);
  for(const key of Object.keys(before).filter((key)=>key!=='keeperProfiles')) assert.deepEqual(s[key],before[key]);
  let stored; persistWorkspace({setItem:(_,value)=>stored=value},{workspace:s,drafts:[],recordFlags:[]});
  assert.deepEqual(loadWorkspace({getItem:()=>stored}).workspace,s);
  assert.equal(profileIdForHash(profileHash(id)),id);
  assert.equal(filterPeople(peopleForWorkspace(s),'Eimhin','Seeking employment',false).length,1);
});
test('retirement pauses suggestions without deleting selections; employment arranged requires no searching',()=>{
  let s=initialWorkspace();const id=eimhin(s).id;
  s=reduce(s,{type:'keeper-context-save',id,intention:'Planning retirement',preferences:''});
  assert.equal(eimhin(s).opportunities.length,0);
  assert.equal(eimhin(s).consideredOpportunities.length,3);
  assert.equal(peopleForWorkspace(s).at(-2).id,id);
  assert.equal(reduce(s,{type:'keeper-opportunity-add',id,opportunityId:'survey'}),s);
  s=reduce(s,{type:'keeper-context-save',id,intention:'Employment arranged',preferences:''});
  assert.ok(eimhin(s).opportunities.every((o)=>o.nextAction===null));
  assert.equal(filterPeople(peopleForWorkspace(s),'Eimhin',null,true).length,0);
  s=reduce(s,{type:'keeper-context-save',id,intention:'Seeking employment',preferences:''});
  assert.equal(eimhin(s).opportunities.length,3);
});
test('v7 migration adds empty profiles without changing existing workspace; assessment reset retains profile work',()=>{
 const old=initialWorkspace();delete old.keeperProfiles;
 const loaded=loadWorkspace({getItem:()=>JSON.stringify({version:7,workspace:old,drafts:[],recordFlags:[]})});
 assert.equal(loaded.version,11);assert.deepEqual(loaded.workspace,{...old,keeperProfiles:{}});
 const s=reduce(loaded.workspace,{type:'keeper-context-save',id:eimhin(loaded.workspace).id,intention:'Not yet decided',preferences:'Considering other sectors'});
 assert.deepEqual(reduce(s,{type:'reset'}).keeperProfiles,s.keeperProfiles);
});

test('four employment intentions migrate safely and a sent introduction resolves an earlier undecided intention',()=>{
 let s=initialWorkspace();const id=eimhin(s).id;
 s=reduce(s,{type:'opportunity',action:{type:'assessment',value:'worth-discussing'}});
 s=reduce(s,{type:'referral-save',referral:createReferral()});
 s=reduce(s,{type:'simulate-send',approved:true,version:introductionVersion(s.referral)});
 assert.equal(eimhin(s).intention,'Seeking employment');
 assert.equal(eimhin(s).opportunities[0].progress,'Introduction sent');
 s.keeperProfiles[id]={intention:'Not yet discussed',preferences:'Keep my preference text',updatedAt:'2020-01-01T00:00:00Z'};
 const loaded=loadWorkspace({getItem:()=>JSON.stringify({version:8,workspace:s,drafts:[],recordFlags:[]})});
 assert.equal(loaded.workspace.keeperProfiles[id].intention,'Not yet decided');
 assert.equal(loaded.workspace.keeperProfiles[id].preferences,'Keep my preference text');
 assert.deepEqual(loaded.workspace.sentIntroductions,s.sentIntroductions);
 assert.equal(eimhin(loaded.workspace).intention,'Seeking employment');
 for(const intention of ['Not yet decided','Employment arranged','Planning retirement']){
  const updated={...loaded.workspace,keeperProfiles:{[id]:{intention,updatedAt:'2099-01-01T00:00:00Z'}}};
  assert.equal(eimhin(updated).intention,intention);
 }
 const exploring={...s,keeperProfiles:{[id]:{intention:'Exploring options',preferences:'Other sectors'}}};
 assert.equal(loadWorkspace({getItem:()=>JSON.stringify({version:8,workspace:exploring,drafts:[],recordFlags:[]})}).workspace.keeperProfiles[id].intention,'Not yet decided');
});

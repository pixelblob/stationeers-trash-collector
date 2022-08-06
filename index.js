const {xml2json, json2xml} = require('xml-js');
const fs = require("fs")
const xmlWorldData = fs.readFileSync('./world.xml', 'utf8');

console.log("Converting World XML to JSON")
var world = JSON.parse(xml2json(xmlWorldData, {compact: true}));
var deletedThings = []


world.WorldData.Things.ThingSaveData.forEach((thing, index)=>{
    if (!thing.PrefabName) return;
    if (thing.ParentReferenceId?._text != 0) return;
    if (thing.DamageState.Brute._text == 0 || JSON.parse(thing.Dragged._text) || JSON.parse(thing.IsCustomName._text)) return;
    
    if (thing.PrefabName._text.startsWith("Item")) {
        deletedThings.push(thing)
        console.log("\x1b[31mDeleting: \x1b[0m"+thing.PrefabName._text)
        world.WorldData.Things.ThingSaveData.splice(index, 1);
    }
})

console.log("Cleaning children!")
world.WorldData.Things.ThingSaveData.forEach((thing, index)=>{
    var childIndex = deletedThings.findIndex(t=> t.ReferenceId._text == thing.ParentReferenceId?._text)
    var child = deletedThings[childIndex]
    if (child) {
        console.log('\x1b[33m%s\x1b[0m',`Deleting child:\x1b[0m \x1b[35m${thing.PrefabName._text}\x1b[0m from \x1b[32m${deletedThings.find(i=>i.ReferenceId._text == thing.ParentReferenceId?._text).PrefabName._text}`)
        deletedThings.push(child)
        world.WorldData.Things.ThingSaveData.splice(childIndex, 1);
    }
})

console.log(`Deleted ${deletedThings.length} item${deletedThings.length != 1 ? "'s" : ""}`)



fs.writeFileSync("cleanworld.xml",json2xml(world, {compact: true, ignoreComment: true, spaces: 2}))
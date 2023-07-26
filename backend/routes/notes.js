const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");


//ROUTE-1 get all Notes using: get "/api/Notes/getuser".no login required
router.get('/fetchallnotes',fetchuser,async (req,res)=>{

    try {
        
   
    const notes = await Note.find({user: req.user.id});
   
   
    res.json(notes)
} catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error ");
        
}

    
})


//ROUTE-2 add a new  Notes using: get "/api/Notes/addnote".no login required
router.post('/addnote',fetchuser,[
     body("title", "enter a valid title").isLength({ min: 3 }),
body("description", "description must be atleast five character ").isLength({min:5}),],async (req,res)=>
{
    try {
        
    

const {title,description ,tag} =req.body;
      //if there are error ,return bad request nd the errors

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
   
   const note = new Note({
       title,description,tag, user: req.user.id


   })
   const savedNote = await note.save()
   
    res.json(savedNote)
} catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error ");
}

})

//ROUTE-3 update  an existing note  using: put "/api/notes/updatenote". login required
router.put('/updatenote/:id',fetchuser,async (req,res) =>{

const {title,description,tag} =req.body;
try {
    

//create a neNote object
const newNote ={};
if (title){newNote.title =title};
if (description){newNote.description =description};
if (tag){newNote.tag =tag};


//find the note to be updated and  update it
let note = await Note.findById(req.params.id);
if(!note) {return res.status(404).send ("not found")}


if(note.user.toString() !== req.user.id){
    return res.status(401).send("NotAllowed");


}
note = await Note.findByIdAndUpdate(req.params.id,{$set: newNote},{new:true})
res.json({note});
} catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error ");
    }




})
//ROUTE-4 delete  an existing note  using: delete "/api/notes/deletenote". login required
router.delete('/deletenote/:id',fetchuser,async (req,res) =>{

  
    try{

    
    
    //find the note to be deleted and  delete it
    let note = await Note.findById(req.params.id);
    if(!note) {return res.status(404).send ("not found")}


    //allow deletion only if user own his note
    
    
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("NotAllowed");
    
    
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success": "Note has been deleted" , note: note });
} catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error ");
    }



})    
    












module.exports = router
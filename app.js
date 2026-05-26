import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);


// ==========================
// AUTH SYSTEM
// ==========================

async function signUp(email, password){
  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if(error) alert(error.message);
  else alert("Registration successful!");
}


async function login(email, password){

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if(error) alert(error.message);
  else window.location.href = "dashboard.html";
}


// ==========================
// PLAYER APPLICATION
// ==========================

async function submitApplication(data){

  const { error } = await supabase
    .from("applications")
    .insert([data]);

  if(error) alert(error.message);
  else alert("Application Submitted!");
}


// ==========================
// DOCUMENT UPLOAD
// ==========================

async function uploadDocument(file, userId){

  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("player-documents")
    .upload(fileName, file);

  if(error){
    alert(error.message);
    return;
  }

  const fileUrl =
    `${YOUR_SUPABASE_URL}/storage/v1/object/public/player-documents/${fileName}`;

  await supabase.from("documents").insert([{
    user_id: userId,
    document_type: "passport",
    file_url: fileUrl
  }]);

  alert("Document uploaded!");
}
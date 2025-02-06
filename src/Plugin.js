import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Quiz from "./components/quiz"; // Quiz component
// export default function Plugin() {
//   return (
//     <div>
//       <AppBar /> 
//       {/* <h1>To do List</h1> */}
//       <List />
//     </div>
//   );
// }

export default function Plugin() {
  return (
    
    <Router>
      <Routes>
      
        {/* Main List */}
        <Route path="/" element={<Quiz />} />
        {/* Quiz */}
        {/* <Route path="/quiz" element={<Quiz onFinish={(score) => alert(`You scored ${score}!`)} />} /> */}
      </Routes>
    </Router>
  );
}





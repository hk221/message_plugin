import React, { useState } from "react";
import { Box, Button, Typography, Radio, RadioGroup, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    answer: "Paris",
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    answer: "4",
  },
  {
    question: "What is the square root of 16?",
    options: ["2", "3", "4", "5"],
    answer: "4",
  },
];

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleNext = () => {
    if (selectedOption === currentQuestion.answer) {
      setScore(score + 1);
    }
    setSelectedOption("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleClose = () => {
    setShowResult(false);
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 4, textAlign: "center" }}>
      {!showResult ? (
        <>
          <Typography variant="h4" gutterBottom>
            {currentQuestion.question}
          </Typography>
          <RadioGroup value={selectedOption} onChange={handleOptionChange} sx={{ marginBottom: 2 }}>
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
          <Button variant="contained" color="primary" onClick={handleNext} disabled={!selectedOption}>
            {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </>
      ) : (
        <Dialog open={showResult} onClose={handleClose}>
          <DialogTitle>Quiz Completed</DialogTitle>
          <DialogContent>
            <Typography>Your score: {score} / {questions.length}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" variant="contained">OK</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

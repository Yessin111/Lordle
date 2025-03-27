import {Paper} from "@mui/material";
import * as React from "react";

export const CustomPaper = (props) => {
    return <Paper {...props} sx={{backgroundColor: "#1d1f23", color: "#fff", borderRadius: "10px"}}/>;
};
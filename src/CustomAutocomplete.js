import {Autocomplete} from "@mui/material";
import {styled} from "@mui/material/styles";

export const CustomAutocomplete = styled(Autocomplete)({
    "& .MuiInputBase-input": {
        fontSize: "1.5rem", // Increase placeholder and input text size
    }, "& .MuiOutlinedInput-root": {
        backgroundColor: "#1d1f23", // Dark background
        // opacity: 0.5,
        color: "#fff", borderRadius: "25px", "&:hover": {
            borderColor: "#666",
        }, "& fieldset": {
            border: "none",
        },
    }, "& .MuiAutocomplete-popupIndicator, .MuiAutocomplete-clearIndicator": {
        display: 'none',
    }, "& .MuiAutocomplete-listbox": {
        backgroundColor: "#222", color: "#fff",
    }, '& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover': {
        backgroundColor: "#666",
    },
});
import {Box, Card, List, ListItem, TextField, ThemeProvider, Typography} from "@mui/material";
import './App.css';
import lorcanaTheme from './theme';
import * as React from "react";
import {useEffect, useState} from "react";
import {columns, emptyGuessed} from "./columns";
import {CustomAutocomplete} from "./CustomAutocomplete";
import {CustomPaper} from "./CustomPaper";
import Confetti from "react-confetti-boom";

function Wordle() {
    const [data, setData] = useState(null);
    const [randomCard, setRandomCard] = useState(null);
    const [filteredCards, setFilteredCards] = useState([]);
    const [filteredCardsPerma, setFilteredCardsPerma] = useState([]);
    const [guessed, setGuessed] = useState(emptyGuessed);
    const [guessText, setGuessText] = useState('Guess');
    const [rows, setRows] = useState([]);
    const [value, setValue] = React.useState(null);
    const [inputValue, setInputValue] = React.useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isExploding, setIsExploding] = React.useState(false);
    const [hovered, setHovered] = useState(null);
    const [gameComplete, setGameComplete] = useState(false);

    const rarities = ["Common", "Uncommon", "Rare", "Super Rare", "Legendary"];

    useEffect(() => {
        fetch('/allCards.json')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (hovered !== null && guessed[hovered] === "???") {
            setGuessed(prevState => ({
                ...prevState,
                [hovered]: "Reveal?"
            }));
        } else if (hovered === null) {
            setGuessed(prevState => {
                const updatedGuessed = {...prevState}; // Create a shallow copy of the object
                for (const key in prevState) {
                    if (prevState[key] === "Reveal?") {
                        updatedGuessed[key] = "???"; // Only reset fields with "Reveal?"
                    }
                }
                return updatedGuessed; // Return the updated object
            });
        }
    }, [hovered]);

    const generateFilteredCards = (data) => {
        setFilteredCardsPerma(data.cards.filter(card => rarities.includes(card.rarity) && !card.foilTypes.includes("Silver") && card.variant === undefined && card.name !== "Half Hexwell Crown").sort((a, b) => {
            const nameComparison = a.name.localeCompare(b.name);
            if (nameComparison !== 0) return nameComparison;
            if (a.version === undefined && b.version === undefined) return 0;
            if (a.version === undefined) return 1;
            if (b.version === undefined) return -1;
            return a.version.localeCompare(b.version);
        }));
    }

    const generateRandomCard = (cardsList) => {
        const card = cardsList[Math.floor(Math.random() * cardsList.length)];
        const finishedCard = buildCard(card)
        setRandomCard(finishedCard);
        window.sessionStorage.setItem("randomCard", JSON.stringify(finishedCard));
    }

    const addRow = (card) => {
        setGuessed(prevGuessed => {
            Object.keys(prevGuessed).forEach(key => {
                if (prevGuessed[key] === "???" || key === "image") {
                    console.log(key)
                    if (
                        key === "color" &&
                        card[key].length === randomCard[key].length &&
                        card[key].filter(element => randomCard[key].includes(element)).length === randomCard[key].length
                    ) {
                        prevGuessed[key] = randomCard[key];
                    } else if (card[key] === randomCard[key]) {
                        prevGuessed[key] = randomCard[key];
                    }
                }
            });
            return prevGuessed;
        });
        setRows(prevRows => [card, ...prevRows]);
        if (cardsMatch(card, randomCard)) {
            handleImageClick(card.image, card.type === "Location");
            setIsExploding(true);
            setGameComplete(true)
            setGuessText("Congratulations! Click here to reset the game🌴");
        }
    };

    const handleImageClick = (imageSrc, rotate) => {
        setSelectedImage({src: imageSrc, rotate}); // Set the clicked image
        setModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setIsExploding(false);
        setModalOpen(false);
        setSelectedImage(null);
    };

    const cardsMatch = (card1, card2) => {
        return Object.keys(card1).every((key) => {
            if (Array.isArray(card1[key]) && Array.isArray(card2[key])) {
                return (card1[key].length === card2[key].length && card1[key].every((element) => card2[key].includes(element)));
            }
            return card1[key] === card2[key];
        });
    }

    const getBorder = (row, field) => {
        const customColors = {
            green: "rgba(127,188,117, 0.75)",
            red: "rgba(237,103,114, 0.75)",
            yellow: "rgba(255,212,112, 0.75)"
        }

        if (field === "image") {
            return "inherit";
        } else if (field === "name" && randomCard[field].split(' | ')[0] === row[field].split(' | ')[0] && row[field] !== randomCard[field]  ) {
            return `3px solid ${customColors.yellow}`;
        } else if (field === "color" && row[field].length === randomCard[field].length && row[field].filter(element => randomCard[field].includes(element)).length === row[field].length) {
            return `3px solid ${customColors.green}`;
        } else if (field === "color" && row[field].filter(element => randomCard[field].includes(element)).length === 1) {
            return `3px solid ${customColors.yellow}`;
        } else if (row[field] === randomCard[field]) {
            return `3px solid ${customColors.green}`;
        } else {
            return `3px solid ${customColors.red}`;
        }
    }

    const buildCard = (card) => {
        return {
            id: card.id,
            image: card.images.full,
            name: card.version ? `${card.name} | ${card.version}` : card.name,
            story: card.story,
            set: Object.values(data.sets).map(set => set.name)[card.setCode - 1],
            cost: card.cost,
            type: card.type,
            color: card.color.includes('-') ? card.color.split('-') : [card.color],
            inkwell: card.inkwell ? "Yes" : "No",
            rarity: card.rarity,
        }
    }

    const reveal = (field) => {
        if (guessed[field] === "???" || guessed[field] === "Reveal?") {
            setGuessed(prevState => ({
                ...prevState,
                [field]: randomCard[field]
            }));
        }
    }

    if (!data) {
        return <div className="App">
            <header className="App-header"><h1 style={{marginBottom: "0.25em"}}>Loading...</h1></header>
        </div>;
    } else if (filteredCards.length === 0) {
        setRandomCard(JSON.parse(window.sessionStorage.getItem("randomCard")));
        generateFilteredCards(data)
        setFilteredCards(filteredCardsPerma)
    } else if (!randomCard) {
        generateRandomCard(filteredCards)
    }

    console.log(randomCard)

    return (<ThemeProvider theme={lorcanaTheme}>
        <div className="App">
            <header className="App-header">
                <div style={{
                    top: "0px",
                    position: "fixed",
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: "center",
                    alignItems: "center",
                    zIndex: "1",
                    width: "100vw",
                    height: "40vh",
                    backgroundColor: "inherit",
                }}>
                    <h1 style={{marginBottom: "0.25vh"}}>Guess the Lorcana Card</h1>
                    <Box onClick={() => {
                        if (gameComplete) {
                            setGameComplete(false)
                            setGuessed({...emptyGuessed});
                            setGuessText("Guess");
                            setRows([]);
                            setFilteredCards(filteredCardsPerma);
                            generateRandomCard(filteredCards)
                        }
                    }}>
                        <CustomAutocomplete
                            PaperComponent={CustomPaper}
                            disablePortal
                            options={filteredCards}
                            noOptionsText="No cards found"
                            value={value}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setValue(null);
                                    setInputValue('');
                                    addRow(buildCard(newValue));
                                    setFilteredCards((prevState) => prevState.filter(card => card.id !== newValue.id));
                                }
                            }}
                            inputValue={inputValue}
                            onInputChange={(event, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            getOptionLabel={(option) => option.version ? `${option.name} | ${option.version}` : option.name}
                            renderOption={(props, option) => {
                                const {key, ...optionProps} = props;
                                return (<Box key={key} component="li" sx={{
                                    '& > img': {mr: 2, flexShrink: 0, width: "15%"},
                                    fontSize: "1.25rem"
                                }} {...optionProps}>
                                    <img srcSet={option.images.full} src={option.images.full}/>
                                    {option.version ? `${option.name} | ${option.version}` : option.name}
                                </Box>);
                            }}
                            renderInput={(params) => <TextField {...params} placeholder={guessText}/>}
                            sx={{
                                width: "25vw",
                                "& input": {color: "#fff", opacity: 1},
                                "& .MuiInputBase-input::placeholder": {color: "#fff", opacity: 0.5},
                            }}
                            componentsProps={{
                                popper: {sx: {"& .MuiAutocomplete-noOptions": {color: "#fff", fontSize: "1.25rem"}}}
                            }}
                        />
                    </Box>
                    <br/>
                    <div style={{textAlign: "center", marginTop: "-1vh"}}>
                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: columns.map(col => `${col.width}`).join(" "),
                            gap: 1,
                            backgroundColor: "#1d1f23",
                            color: "#fff",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            borderRadius: "8px"
                        }}>
                            {columns.map((col) => (<Typography key={"columns_" + col.field} variant="body1"
                                                               sx={{fontWeight: "bold", fontSize: "1.5rem"}}>
                                {col.headerName}
                            </Typography>))}
                        </Box>
                        <Box sx={{
                            display: "grid",
                            gridTemplateColumns: columns.map(col => `${col.width}`).join(" "),
                            gap: 1,
                            backgroundColor: "#1d1f23",
                            color: "#fff",
                            paddingLeft: "5px",
                            paddingRight: "5px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            borderRadius: "8px",
                            marginTop: "10px",
                            marginBottom: "0.25em"
                        }}
                        >
                            {columns.map((col) => (<Typography key={"guessed_" + col.field} variant="body1"
                                                               sx={{
                                                                   fontWeight: "bold",
                                                                   fontSize: "1.5rem",
                                                                   display: "flex",
                                                                   textAlign: "center",
                                                                   alignItems: "center",
                                                                   justifyContent: "center"
                                                               }}
                                                               onMouseEnter={() => setHovered(col.field)}
                                                               onMouseLeave={() => setHovered(null)}
                                                               onClick={() => reveal(col.field)}
                            >
                                {col.field === "image" ? (<img
                                    key={guessed[col.field]}
                                    src={guessed[col.field]}
                                    alt="CardColor"
                                    style={{
                                        width: "60%", display: "inline-block", verticalAlign: "middle"
                                    }}
                                    onClick={() => handleImageClick(guessed[col.field], col.field === "Location")}
                                />) : col.field === "name" && guessed[col.field].includes('|') ? (<>
                                    {guessed[col.field].split('|')[0]}
                                    <br/>
                                    {guessed[col.field].split('|')[1]}
                                </>) : guessed[col.field]}
                            </Typography>))}
                        </Box>
                    </div>
                </div>
                <div style={{textAlign: "center", marginTop: "40vh", zIndex: "0", marginBottom: "1rem"}}>
                    <List sx={{display: "flex", flexDirection: "column", gap: 2, marginTop: "20px"}}>
                        {rows.map((row) => (<ListItem key={row.name} sx={{padding: 0}}>
                            <Card sx={{
                                backgroundColor: "#1d1f23",
                                color: "#fff",
                                borderRadius: "8px",
                                display: "grid",
                                gridTemplateColumns: columns.map(col => `${col.width}`).join(" "),
                                gap: 1,
                                paddingLeft: "5px",
                                paddingRight: "5px",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                textAlign: "center",
                                alignItems: "center",
                            }}>
                                {columns.map((col) => (<Box
                                    key={col.field}
                                    style={{
                                        border: getBorder(row, col.field),
                                        display: "flex",
                                        alignItems: "center", // Vertically center the content
                                        justifyContent: "center", // Horizontally center the content (optional)
                                        height: "100%", // Ensure the box takes full height
                                        boxSizing: "border-box",
                                        marginLeft: "5px",
                                        marginRight: "5px", // marginTop: "3px",
                                        // marginBottom: "3px",
                                        // padding: "5px",
                                    }}
                                >
                                    <Typography key={col.field} sx={{
                                        fontSize: "1.5rem",
                                    }}>
                                        {col.field === "image" ? (<img
                                            key={row[col.field]}
                                            src={row[col.field]}
                                            alt="CardImg"
                                            style={{
                                                width: "60%", display: "inline-block", verticalAlign: "middle"
                                            }}
                                            onClick={() => handleImageClick(row.image, row.type === "Location")}
                                        />) : col.field === "rarity" ? (<img
                                            key={row[col.field]}
                                            src={"img/" + row[col.field].replace(/\s+/g, '').toLowerCase() + ".png"}
                                            alt="CardRarity"
                                            style={{
                                                width: "40%", display: "inline-block", verticalAlign: "middle"
                                            }}
                                        />) : col.field === "color" ? (row[col.field].length === 1 ? (<img
                                            key={row[col.field][0]}
                                            src={"img/" + row[col.field][0].replace(/\s+/g, '').toLowerCase() + ".png"}
                                            alt="CardColor"
                                            style={{
                                                width: "50%", display: "inline-block", verticalAlign: "middle"
                                            }}
                                        />) : (<>
                                            <img
                                                key={row[col.field][0]}
                                                src={"img/" + row[col.field][0].replace(/\s+/g, '').toLowerCase() + ".png"}
                                                alt="CardColor"
                                                style={{
                                                    width: "50%",
                                                    display: "inline-block",
                                                    verticalAlign: "middle",
                                                    paddingRight: "22px",
                                                    marginBottom: "-3px"
                                                }}
                                            />
                                            <img
                                                key={row[col.field][1]}
                                                src={"img/" + row[col.field][1].replace(/\s+/g, '').toLowerCase() + ".png"}
                                                alt="CardColor"
                                                style={{
                                                    width: "50%",
                                                    display: "inline-block",
                                                    verticalAlign: "middle",
                                                    paddingLeft: "22px",
                                                    marginTop: "-3px"
                                                }}
                                            />
                                        </>)) : col.field === "name" && row[col.field].includes('|') ? (<>
                                            {row[col.field].split('|')[0]}
                                            <br/>
                                            {row[col.field].split('|')[1]}
                                        </>) : (row[col.field])}
                                    </Typography>
                                </Box>))}
                            </Card>
                        </ListItem>))}
                    </List>
                </div>
            </header>
            {modalOpen && (<div
                className="modal"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 3,
                }}
                onClick={closeModal} // Close modal when clicking outside the image
            >
                <img
                    key={selectedImage.src}
                    src={selectedImage.src}
                    alt="Enlarged"
                    style={{
                        maxWidth: "90%",
                        maxHeight: "90%",
                        borderRadius: "8px",
                        transform: selectedImage.rotate ? "rotate(90deg)" : "none",
                    }}
                />
                <>{isExploding && <Confetti particleCount={200}
                                            colors={["#ffd470", "#ae88b7", "#7fbc75", "#ed6772", "#6cdbf7", "#c3d1da"]}
                                            shapeSize={20} spreadDeg={45} launchSpeed={1.25}/>}</>
            </div>)}
        </div>
    </ThemeProvider>)

}

export default Wordle;
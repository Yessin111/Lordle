export const columns= [
    { field: 'image', headerName: 'Image', width: "5vw" },
    { field: 'name', headerName: 'Name', width: "12.5vw" },
    { field: 'story', headerName: 'Story', width: "10vw" },
    { field: 'set', headerName: 'Set', width: "7.5vw"},
    { field: 'type', headerName: 'Type', width: "6.5vw"},
    { field: 'color', headerName: 'Color', width: "5vw"},
    { field: 'cost', headerName: 'Cost', width: "5vw"},
    { field: 'inkwell', headerName: 'Inkable', width: "5vw"},
    { field: 'rarity', headerName: 'Rarity', width: "5vw"},
];

export const emptyGuessed = Object.fromEntries(columns.map(column => column.field === "image" ? [column.field, "img/lorcana.png"] : [column.field, "???"]));

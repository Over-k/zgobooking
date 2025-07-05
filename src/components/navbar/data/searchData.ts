
export interface SearchField {
    label: string;
    placeholder: string;
    type?: string;
    name: string;
}

export const destinations = [
    "Marrakesh, Morocco",
    "Casablanca, Morocco",
    "Agadir, Morocco",
    "Tangier, Morocco",
    "Fes, Morocco",
    "Chefchaouen, Morocco",
    "Essaouira, Morocco",
    "Rabat, Morocco",
    "Ouarzazate, Morocco",
    "Merzouga, Morocco",
];

export const searchFields: SearchField[] = [
    {
        label: "Where",
        placeholder: "Search destinations",
        name: "location",
        type: "text",
    },
    {
        label: "Check in",
        placeholder: "Add date",
        name: "checkIn",
        type: "date",
    },
    {
        label: "Check out",
        placeholder: "Add date",
        name: "checkOut",
        type: "date",
    },
    {
        label: "Who",
        placeholder: "Add guests",
        name: "guests",
        type: "number",
    },
];

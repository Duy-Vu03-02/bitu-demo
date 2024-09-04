export interface IBooking {
    idUser: string;
    idTicket: string;
}

export interface IConfirmBooking {
    idUser: string;
    idTicket: string;
}

export interface ICancelBooking {
    idUser: string;
    idTicket: string;
}

export interface IBookingIdUser {
    idUser: string;
}

export interface IAllBookingUser {
    id: string;
}

export interface IResponseBookingUser {
    timeStart: Date;
    from: {
        idLocation: string;
        name: String;
    };
    to: {
        idLocation: string;
        name: String;
    };
    quantity: Number;
    price: Number;
    id: string;
    state: string;
}

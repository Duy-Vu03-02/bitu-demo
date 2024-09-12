export interface IBooking {
    idUser: string;
    idTicket: string;
}

export interface IConfirmBooking {
    idUserBooking: string;
    idUser: string;
    timeStart: string;
    idTicket: string;
}

export interface ICancelBooking {
    idUser: string;
    idTicket: string;
    idTicketUserBooking: string;
}

export interface IBookingIdUser {
    idUser: string;
}

export interface IAllBookingUser {
    id: string;
}

export interface IResponseBookingUser {
    id: string;
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
    state: string;
    payment: boolean;
    cancel: boolean;
}

export interface IConfirmSendMail {
    email: string;
    timeStart: Date;
    from: string;
    to: string;
}

export interface IAddIdUserBooking {
    idUserBooking: string;
    idUser: string;
    timeStart: string;
    idTicket: string;
}

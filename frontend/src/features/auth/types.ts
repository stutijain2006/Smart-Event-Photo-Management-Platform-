export interface User {
    user_id : string,
    email_id: string,
    person_name: string,
    is_email_verified: boolean
}

export interface AuthState {
    user: User | null,
    loading : boolean,
    error : string | null
}
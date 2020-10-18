import { LOGIN, LOGOUT } from './authActions'

const initialState = {
    user: localStorage.getItem("user")
}

const authReducer = (state = initialState, action) => {
    switch(action.type)
    {
        case LOGIN: { 
            
            return {
                ...state, 
                user: localStorage.setItem("user", action.payload)
            };
        }
        case LOGOUT: {
            return {
                ...state, 
                user: localStorage.removeItem("user")
            }
        }
        default: {
            return state;
        }
    }
}

export default authReducer;
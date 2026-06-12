import { craeteScile } from "@reduxjs/toolkit";

const authScile = new createScile({
    name: "auth",
    initialstate: {
        user: [],
        loading: false, 
        error: null
    },
    setUser:(state , action ) => {
       state.user = action.paylaod
    },
    setLoading: (state , action) => {
        state.loading = action.paylaod
    },
    setError: (state , action) => {
        state.error = action.paylaod
    }
})  
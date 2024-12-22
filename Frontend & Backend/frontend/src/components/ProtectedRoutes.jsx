import api from '../api'
import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-Decode'
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants'
import { useState, useEffect } from 'react'

function ProtectedRoute({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null)

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const refreshToken = async () => {
        try{
            const res = await api.post("api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access)
            } else {
                setIsAuthorized(false)
            }

        } catch (error) {
            console.log(error)
            setIsAuthorized(false)
        }
    }

    const auth = async () => {
        try{
            const token = localStorage.getItem(ACCESS_TOKEN)
            if(!token) {
                setIsAuthorized(false)
                return
            }
            const decoded = jwtDecode(token)
            const tokenExpiration = decoded.exp
            const now = Date.now() / 1000

            if (tokenExpiration < now) {
                await refreshToken()
            } else {
                setIsAuthorized(true)
            }
        } catch(error) {
            console.error('Error during authentication:', error);
            setIsAuthorized(false);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? children : <Navigate to="/login" />
}

export default ProtectedRoute
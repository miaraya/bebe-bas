import decode from "jwt-decode"
import {login_url} from "./containers/constants"

export default class AuthService {
	// Initializing important variables
	constructor(domain) {
		this.domain = domain || login_url // API server domain
		this.fetch = this.fetch.bind(this) // React binding stuff
		this.login = this.login.bind(this)
		this.getProfile = this.getProfile.bind(this)
	}

	login(username, password) {
		// Get a token from api server using the fetch api
		return this.fetch(`${this.domain}`, {
			method: "POST",
			body: JSON.stringify({
				username,
				password
			})
		}).then(res => {
			if (res.id) this.setToken(res) // Setting the token in localStorage
			return Promise.resolve(res)
		})
	}

	loggedIn() {
		// Checks if there is a saved token and it's still valid
		const token = this.getToken() // GEtting token from localstorage
		return !!token && !this.isTokenExpired(token) // handwaiving here
	}

	isTokenExpired(token) {
		try {
			const decoded = decode(token)
			if (decoded.exp < Date.now() / 1000) {
				// Checking if token is expired. N
				return true
			} else return false
		} catch (err) {
			return false
		}
	}

	setToken(token) {
		// Saves user token to localStorage
		localStorage.setItem("id_token", token.id)
		localStorage.setItem("role", token.role)

		localStorage.setItem("user_id", token.userId)
		localStorage.setItem("username", token.username)
		localStorage.setItem("language", "vietnamese")
		localStorage.setItem("store", token.store_id)
		localStorage.setItem("staff_id", token.staff_id)

	}

	getToken() {
		// Retrieves the user token from localStorage
		return localStorage.getItem("id_token")
	}

	logout() {
		// Clear user token and profile data from localStorage
		localStorage.removeItem("id_token")
		localStorage.removeItem("role")

		localStorage.removeItem("user_id")
		localStorage.removeItem("username")
		//localStorage.removeItem("language")
		localStorage.removeItem("store")
	}

	getProfile() {
		// Using jwt-decode npm package to decode the token
		return {
			token: localStorage.getItem("id_token"),
			role: localStorage.getItem("role"),
			user_id: localStorage.getItem("user_id"),
			username: localStorage.getItem("username"),
			staff_id: localStorage.getItem("staff_id"),
		}
	}

	fetch(url, options) {
		// performs api calls sending the required authentication headers
		const headers = {
			Accept: "application/json",
			"Content-Type": "application/json"
		}

		// Setting Authorization header
		// Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
		if (this.loggedIn()) {
			headers["Authorization"] = "Bearer " + this.getToken()
		}

		return fetch(url, {
			headers,
			...options
		})
			.then(this._checkStatus)
			.then(response => response.json())
	}

	_checkStatus(response) {
		// raises an error in case response status is not a success
		if (response.status >= 200 && response.status < 300) {
			// Success status lies between 200 to 300
			return Promise.resolve(response)
		} else {
			return Promise.resolve(response)
		}
	}
}

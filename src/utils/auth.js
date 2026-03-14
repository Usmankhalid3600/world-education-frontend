// Auth utilities
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const setSessionId = (sessionId) => {
  localStorage.setItem('sessionId', sessionId);
};

export const getSessionId = () => {
  return localStorage.getItem('sessionId');
};

export const removeSessionId = () => {
  localStorage.removeItem('sessionId');
};

export const logout = () => {
  removeAuthToken();
  removeUser();
  removeSessionId();
};

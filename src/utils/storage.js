// Storage utility functions
export const storage = {
  getUsers: () => {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  },
  
  setUsers: (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  },
  
  getProducts: () => {
    const data = localStorage.getItem('products');
    return data ? JSON.parse(data) : [];
  },
  
  setProducts: (products) => {
    localStorage.setItem('products', JSON.stringify(products));
  },
  
  getCurrentUser: () => {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  removeCurrentUser: () => {
    localStorage.removeItem('currentUser');
  }
};
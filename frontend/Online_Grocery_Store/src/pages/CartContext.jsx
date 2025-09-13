import { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from "sonner";

// Create context
const CartContext = createContext(undefined);

// Reducer
function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            } else {
                return {
                    ...state,
                    items: [...state.items, { ...action.payload, quantity: 1 }]
                };
            }
        }

        case 'REMOVE_FROM_CART':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };

        case 'UPDATE_QUANTITY': {
            const { id, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter(item => item.id !== id)
                };
            }
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === id ? { ...item, quantity } : item
                )
            };
        }

        case 'CLEAR_CART':
            return { ...state, items: [] };

        case 'LOAD_CART':
            return { ...state, items: action.payload || [] };

        default:
            return state;
    }
}

// Initial state
const initialState = { items: [] };

// Provider
export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('groceryapp-cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                dispatch({ type: 'LOAD_CART', payload: parsedCart });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('groceryapp-cart', JSON.stringify(state.items));
    }, [state.items]);

    // Actions
    const addToCart = (product) => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const removeFromCart = (productId) => {
        const item = state.items.find(item => item.id === productId);
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
        if (item) {
            toast.info(`${item.name} removed from cart`);
        }
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        const itemCount = state.items.length;
        dispatch({ type: 'CLEAR_CART' });
        if (itemCount > 0) {
            toast.info(`Cart cleared (${itemCount} items removed)`);
        }
    };

    // Helpers
    const getCartItemsCount = () =>
        state.items.reduce((total, item) => total + item.quantity, 0);

    const getCartTotal = () =>
        state.items.reduce((total, item) => total + item.price * item.quantity, 0);

    const getCartItem = (productId) =>
        state.items.find(item => item.id === productId);

    const isInCart = (productId) =>
        state.items.some(item => item.id === productId);

    const value = {
        items: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemsCount,
        getCartTotal,
        getCartItem,
        isInCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Custom hook
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

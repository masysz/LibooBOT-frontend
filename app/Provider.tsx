"use client"
import React from 'react';
import { AppProvider } from './context/ApplicationContext';

type Props = {
    children?: React.ReactNode
}

const GlobalProvider = ({ children }: Props) => {
    return (
        <AppProvider>
            {children}
        </AppProvider>
    );
};

export default GlobalProvider;
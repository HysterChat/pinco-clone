import { useState, useEffect } from 'react';
import api, { FormOptions } from '../services/api';

export const useFormOptions = () => {
    const [formOptions, setFormOptions] = useState<FormOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFormOptions = async () => {
            try {
                const options = await api.getFormOptions();
                setFormOptions(options);
                setError(null);
            } catch (err) {
                setError('Failed to load form options');
                console.error('Error fetching form options:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFormOptions();
    }, []);

    return { formOptions, loading, error };
};

export default useFormOptions; 
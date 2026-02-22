import { useState, useCallback } from 'react';

type SimulatedAsyncOptions = {
    delay?: number;
    shouldFail?: boolean;
};

export function useSimulatedAsync<T>() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (
        action: () => T | Promise<T>,
        options: SimulatedAsyncOptions = {}
    ): Promise<T | null> => {
        const { delay = 800, shouldFail = false } = options;

        setIsLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                if (shouldFail) {
                    setError('Simulated error occurred.');
                    setIsLoading(false);
                    reject(new Error('Simulated error occurred.'));
                    return;
                }

                try {
                    const result = await action();
                    setIsLoading(false);
                    resolve(result);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    setError(errorMessage);
                    setIsLoading(false);
                    reject(err);
                }
            }, delay);
        });
    }, []);

    return { execute, isLoading, error };
}

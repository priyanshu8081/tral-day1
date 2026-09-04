import { toast } from 'react-toastify';

export const ToastService = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    warning: (message) => toast.warning(message),
    
    // Extracted common error handling logic
    handleApiError: (error, defaultMessage = "Something went wrong") => {
        const message = error?.response?.data?.message || defaultMessage;
        toast.error(message);
    }
};

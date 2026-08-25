import {useState} from 'react';

/**
 * Step cursor of a wizard modal. Both file-management wizards share it; each one keeps composing
 * its own footer, since their buttons differ step by step.
 */
export const useWizardSteps = (initialStep: number) => {
    const [currentStep, setCurrentStep] = useState(initialStep);

    return {
        currentStep,
        next: () => setCurrentStep(step => step + 1),
        prev: () => setCurrentStep(step => step - 1),
        reset: () => setCurrentStep(initialStep),
    };
};

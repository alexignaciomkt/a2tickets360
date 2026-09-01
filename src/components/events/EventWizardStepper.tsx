import { Check } from 'lucide-react';

interface WizardStep {
    number: number;
    title: string;
    icon: React.ReactNode;
}

interface EventWizardStepperProps {
    steps: WizardStep[];
    currentStep: number;
    onStepClick?: (step: number) => void;
}

const EventWizardStepper = ({ steps, currentStep, onStepClick }: EventWizardStepperProps) => {
    const currentStepData = steps.find(s => s.number === currentStep);
    const progressPercent = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

    return (
        <div className="w-full mb-8">
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    const isClickable = step.number < currentStep && onStepClick;

                    return (
                        <div key={step.number} className="flex items-center flex-1 last:flex-initial">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => isClickable && onStepClick(step.number)}
                                    disabled={!isClickable}
                                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-500 ease-out
                    ${isCompleted
                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-110'
                                            : isActive
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 scale-110'
                                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </button>
                                <span className={`
                  mt-2 text-xs font-medium text-center max-w-[80px] leading-tight
                  transition-colors duration-300
                  ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}
                `}>
                                    {step.title}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-3 mt-[-20px]">
                                    <div className="h-[2px] bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-full'
                                                    : isActive
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-1/2'
                                                        : 'w-0'
                                                }`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile Stepper — Compact */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">
                        Etapa {currentStep} de {steps.length}
                    </span>
                    {currentStepData && (
                        <span className="text-sm font-medium text-indigo-600 truncate ml-2">
                            {currentStepData.title}
                        </span>
                    )}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                {/* Mini step indicators */}
                <div className="flex items-center justify-between mt-2 px-0.5">
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isActive = step.number === currentStep;
                        return (
                            <button
                                key={step.number}
                                onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
                                disabled={!isCompleted || !onStepClick}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                                    ${isCompleted
                                        ? 'bg-emerald-500 text-white cursor-pointer'
                                        : isActive
                                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}
                            >
                                {isCompleted ? <Check className="h-3 w-3" /> : step.number}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default EventWizardStepper;


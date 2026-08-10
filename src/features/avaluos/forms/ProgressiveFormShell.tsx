import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

type Step = {
  title: string;
  description?: string;
};

type Props = {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  onFinal: () => void;
  loading?: boolean;
  finalLabel: string;
  formId: string;
};

export default function ProgressiveFormShell({
  steps,
  currentStep,
  onStepChange,
  children,
  onFinal,
  loading = false,
  finalLabel,
  formId,
}: Props) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const active = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const moveTo = (nextStep: number) => {
    const safe = Math.max(0, Math.min(steps.length - 1, nextStep));
    onStepChange(safe);
    requestAnimationFrame(() => {
      document.getElementById(formId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return <div id={formId} className='progressive-form'>
    <div className='progressive-form-overview'>
      <div className='progressive-form-progress-copy'>
        <span>ETAPA {currentStep + 1} DE {steps.length}</span>
        <strong>{active?.title}</strong>
        {active?.description && <small>{active.description}</small>}
      </div>
      <div className='progressive-form-meter' aria-label={`Progreso ${Math.round(progress)}%`}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <div className='progressive-form-steps'>
        {steps.map((step, index) => <button
          type='button'
          key={step.title}
          className={`${index === currentStep ? 'is-active' : ''} ${index < currentStep ? 'is-complete' : ''}`}
          onClick={() => moveTo(index)}
          aria-current={index === currentStep ? 'step' : undefined}
        >
          <span>{index < currentStep ? <Check /> : index + 1}</span>
          <em>{step.title}</em>
        </button>)}
      </div>
    </div>

    <div className='progressive-form-stage' key={currentStep}>{children}</div>

    <div className='progressive-form-actions'>
      <button type='button' className='progressive-secondary' disabled={isFirst || loading} onClick={() => moveTo(currentStep - 1)}>
        <ChevronLeft /> Anterior
      </button>
      <div className='progressive-form-position'><strong>{currentStep + 1}</strong><span>/ {steps.length}</span></div>
      {isLast
        ? <button type='button' className='progressive-primary is-final' disabled={loading} onClick={onFinal}>{loading ? 'Calculando…' : finalLabel}</button>
        : <button type='button' className='progressive-primary' disabled={loading} onClick={() => moveTo(currentStep + 1)}>Continuar <ChevronRight /></button>}
    </div>
  </div>;
}

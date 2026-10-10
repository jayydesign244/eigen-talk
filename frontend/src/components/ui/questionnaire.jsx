import { CheckIcon } from "lucide-react";
import { Questionnaire as QuestionnairePrimitive } from "@shadcn/react/questionnaire";
import { buttonVariants } from "@/components/ui/button";
import { inputBase } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Step-by-step questions (onboarding, feedback, setup). Choices are full-width
 * cards: the selected one gets an ink border and a soft lift.
 */
function Questionnaire({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Root
      data-slot="questionnaire"
      className={cn("flex w-full min-w-0 flex-col gap-5", className)}
      {...props}
    />
  );
}

function QuestionnaireProgress({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Progress
      data-slot="questionnaire-progress"
      className={cn(
        "min-h-[1lh] w-fit min-w-[14ch] text-[10px] font-bold tracking-[0.12em] text-label uppercase tabular-nums",
        className
      )}
      {...props}
    />
  );
}

function QuestionnaireItem({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Item
      data-slot="questionnaire-item"
      className={cn("flex min-w-0 animate-rise flex-col gap-4 border-0 p-0 outline-hidden", className)}
      {...props}
    />
  );
}

function QuestionnaireTitle({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Title
      data-slot="questionnaire-title"
      className={cn(
        "font-display text-2xl leading-tight text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-2",
        className
      )}
      {...props}
    />
  );
}

function QuestionnaireDescription({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Description
      data-slot="questionnaire-description"
      className={cn("text-sm text-pretty text-muted-foreground", className)}
      {...props}
    />
  );
}

function QuestionnaireChoices({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Choices
      data-slot="questionnaire-choices"
      className={cn("group/questionnaire-choices grid min-w-0 gap-2", className)}
      {...props}
    />
  );
}

function QuestionnaireChoice({ children, className, ...props }) {
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        "group/questionnaire-choice relative flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-[0.8px] border-border bg-card px-3.5 py-3 text-start text-sm transition-[border-color,background-color,box-shadow] duration-150 outline-hidden select-none hover:border-foreground/30 hover:bg-surface-2 has-[>input:focus-visible]:outline-2 has-[>input:focus-visible]:outline-solid has-[>input:focus-visible]:outline-offset-2 has-[>input:focus-visible]:outline-ring data-invalid:border-destructive data-checked:border-foreground data-checked:bg-card data-checked:shadow-soft",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-45",
        className
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        className="pointer-events-none relative flex size-5 shrink-0 items-center justify-center rounded-sm border border-input bg-card transition-colors group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-foreground group-data-checked/questionnaire-choice:bg-foreground group-data-checked/questionnaire-choice:text-background"
      >
        <span
          data-slot="questionnaire-choice-indicator-dot"
          className="hidden size-[7px] animate-pop rounded-full bg-card group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
        />
        <CheckIcon
          data-slot="questionnaire-choice-indicator-check"
          strokeWidth={3}
          className="hidden size-3.5 animate-pop group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug font-semibold"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        className="pointer-events-none ms-auto hidden h-5 min-w-5 shrink-0 items-center justify-center rounded-sm border-[0.8px] border-border-cool bg-chip px-1 font-mono text-[10px] leading-none font-bold text-muted-foreground group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </QuestionnairePrimitive.Choice>
  );
}

function QuestionnaireChoiceDescription({ className, ...props }) {
  return (
    <span
      data-slot="questionnaire-choice-description"
      className={cn("text-[13px] font-normal text-muted-foreground", className)}
      {...props}
    />
  );
}

function QuestionnaireInput({ className, ...props }) {
  return (
    <div data-slot="questionnaire-input-wrapper" className="group/questionnaire-input relative w-full min-w-0">
      <QuestionnairePrimitive.Input
        data-slot="questionnaire-input"
        className={cn(inputBase, "h-11", className)}
        {...props}
      />
    </div>
  );
}

function QuestionnaireError({ className, ...props }) {
  return (
    <QuestionnairePrimitive.Error
      data-slot="questionnaire-error"
      className={cn("mt-1 text-[13px] font-semibold text-destructive-ink", className)}
      {...props}
    />
  );
}

function QuestionnaireActions({ className, ...props }) {
  return (
    <div
      data-slot="questionnaire-actions"
      className={cn("grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3", className)}
      {...props}
    />
  );
}

function makeAction(Primitive, slot, fallback, defaultVariant, placement) {
  function Action({ children, className, size = "default", variant = defaultVariant, ...props }) {
    return (
      <Primitive
        data-slot={slot}
        data-size={size}
        data-variant={variant}
        className={cn(buttonVariants({ size, variant }), placement, className)}
        {...props}
      >
        {children ?? fallback}
      </Primitive>
    );
  }
  return Action;
}

const QuestionnairePrevious = makeAction(
  QuestionnairePrimitive.Previous, "questionnaire-previous", "Previous", "ghost", "col-start-1 row-start-1 justify-self-start"
);
const QuestionnaireSkip = makeAction(
  QuestionnairePrimitive.Skip, "questionnaire-skip", "Skip", "outline", "col-start-2 row-start-1 justify-self-end"
);
const QuestionnaireNext = makeAction(
  QuestionnairePrimitive.Next, "questionnaire-next", "Next", "default", "col-start-3 row-start-1 justify-self-end"
);
const QuestionnaireSubmit = makeAction(
  QuestionnairePrimitive.Submit, "questionnaire-submit", "Submit", "brand", "col-start-3 row-start-1 justify-self-end"
);

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle
};

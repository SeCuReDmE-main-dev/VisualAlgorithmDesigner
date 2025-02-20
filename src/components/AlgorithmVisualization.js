import * as React from "react";
import { Card } from "@github/spark/components";

function AlgorithmVisualization({ steps, currentStep }) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Algorithm Execution</h2>
      {steps.map((step, index) => (
        <Card
          key={step.id}
          className={`mb-2 p-2 ${index === currentStep ? 'bg-accent-5' : 'bg-neutral-1'}`}
        >
          {step.content}
        </Card>
      ))}
    </div>
  );
}

export default AlgorithmVisualization;

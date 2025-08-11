import { useState } from "react";

export default function Volume() {
    const [centerValue, setCenterValue] = useState(0.01);
    const [scale, setScale] = useState(1);
    const [inputValue, setInputValue] = useState(centerValue.toString());

    const baseSteps = [-0.5, -0.1, 0.1, 0.5];

    const adjustScale = (newValue: number) => {
        let newScale = scale;

        if (newScale >= 100) {
            while (newValue < newScale / 10 && newScale > 0.1) {
                newScale = newScale / 10;
            }
        } else {
            while (newValue > newScale) {
                newScale *= 10;
            }
        }
        return newScale;
    };

    const handleClick = (step: number) => {
        const newValue = +(centerValue + step).toFixed(4);
        let newScale = adjustScale(newValue);

        if (newValue >= 1) {
            setCenterValue(1);
            setInputValue('1');
        } else if (newValue < 0.01) {
            setCenterValue(0.01);
            setInputValue('0.01');
        } else {
            setCenterValue(newValue);
            setInputValue(newValue.toString());
        }

        if (newScale <= 0.1) {
            newScale = 1
        }

        setScale(newScale);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (Number(e.target.value) > 1) return setInputValue("1")
        if (e.target.value === "") return setInputValue("0.01")
        setInputValue(e.target.value);
    };

    // const steps = [
    //     +(baseSteps[0] * scale).toFixed(2),
    //     +(baseSteps[1] * scale).toFixed(2),
    //     +centerValue.toFixed(2),
    //     +(baseSteps[2] * scale).toFixed(2),
    //     +(baseSteps[3] * scale).toFixed(2),
    // ];

    const steps = [
        +(baseSteps[0]).toFixed(2),
        +(baseSteps[1]).toFixed(2),
        +centerValue.toFixed(2),
        +(baseSteps[2]).toFixed(2),
        +(baseSteps[3]).toFixed(2),
    ];

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="flex justify-between text-black text-sm font-semibold">
                {steps.map((step, idx) => {
                    if (idx === 2) {
                        return (
                            <input
                                key="center"
                                type="number"
                                value={inputValue}
                                onChange={handleInputChange}
                                max={200}
                                className="w-20 text-center font-bold px-1 py-0.5 appearance-none focus:outline-none focus:ring-0 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [MozAppearance:textfield]"
                            />
                        );
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleClick(step)}
                            className="cursor-pointer px-2 py-1 transition-all duration-150 active:scale-95 hover:bg-[var(--color-background-opacity-2)] rounded-lg"
                        >
                            {step > 0 ? `+${step}` : step}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

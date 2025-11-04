import { useEffect, useState } from 'react';
import bg from '../assets/images/bg-splash.jpg';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
    const { t } = useTranslation()
    const [size, setSize] = useState(0);

    useEffect(() => {
        const t2 = setTimeout(() => {
            let start = 0;
            let end = 200; // % kích thước so với chiều dài màn hình
            let duration = 1500;
            let startTime: any = null;

            function animateCircle(timestamp: any) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const current = start + (end - start) * progress;
                setSize(current);
                if (progress < 1) requestAnimationFrame(animateCircle);
            }
            requestAnimationFrame(animateCircle);
        }, 1100);

        return () => {
            clearTimeout(t2);
        };
    }, []);

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                WebkitMask: `radial-gradient(circle ${size}vmax at 50% 50%, transparent 99%, black 100%)`,
                mask: `radial-gradient(circle ${size}vmax at 50% 50%, transparent 99%, black 100%)`,
                transition: 'mask 0.05s linear, -webkit-mask 0.05s linear',
            }}
        >
            <span className="font-dancing-bold text-white text-shadow-[var(--color-text-shadown)] md:text-5xl text-[14px]">{t("Chào mừng bạn đến với dịch vụ của chúng tôi!")}</span>
        </div>
    );
}

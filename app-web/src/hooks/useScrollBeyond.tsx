import { useEffect, useState } from "react";

const useScrollBeyond = (threshold: number): boolean => {
	const [hasScrolledBeyond, setHasScrolledBeyond] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const handleScroll = () => {
			setHasScrolledBeyond(window.scrollY > threshold);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [threshold]);

	return hasScrolledBeyond;
};

export default useScrollBeyond;

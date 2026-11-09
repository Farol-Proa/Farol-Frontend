
export default function Logo({ className = "h-10 w-auto" }) {
    return (
        <img
            src="/images/logo.png"
            alt="Farol"
            className={`object-contain ${className}`}
        />
    );
}

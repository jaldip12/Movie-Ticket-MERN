export default function Container({ children, classes }) {
    return (
        <div className={"rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-darkLight " + classes}>
            {children}
        </div>
    )
}
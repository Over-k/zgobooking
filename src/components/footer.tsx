export default function Footer() {
  return (
    <section className="py-32">
      <div className="container">
        <footer>
          <div className="mt-24 flex flex-col justify-between gap-4 border-t pt-8 text-sm font-medium text-muted-foreground md:flex-row md:items-center">
            <p>Copyright &copy; {new Date().getFullYear()}</p>
            <ul className="flex gap-4">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
}

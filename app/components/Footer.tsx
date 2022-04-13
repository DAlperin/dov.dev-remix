import { FaTwitter, FaEnvelope, FaGithub } from "react-icons/fa";

export default function Footer(): JSX.Element {
    return (
        <footer className="flex items-center justify-center opacity-60">
            <div className="flex flex-col items-center">
                <div className="flex space-x-2 footer-social-icons mb-1">
                    <a
                        target="_blank"
                        href="https://twitter.com/dovunderscore"
                        rel="noreferrer"
                        aria-label="Twitter"
                    >
                        <FaTwitter />{" "}
                    </a>
                    <a
                        target="_blank"
                        href="https://github.com/DAlperin"
                        rel="noreferrer"
                        aria-label="Github"
                    >
                        <FaGithub />
                    </a>
                    <a
                        target="_blank"
                        href="mailto:dov@dov.dev"
                        rel="noreferrer"
                        aria-label="Email"
                    >
                        <FaEnvelope />
                    </a>
                </div>
                <div>
                    <p className="m-0">
                        Dov Alperin • ©{new Date().getFullYear()} • dov.dev
                    </p>
                </div>
            </div>
        </footer>
    );
}

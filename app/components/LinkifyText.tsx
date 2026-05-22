const URL_REGEX = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;

export default function LinkifyText({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (/^(https?:\/\/|www\.)/.test(part)) {
          const href = part.startsWith("www.") ? `https://${part}` : part;
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700 break-all"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

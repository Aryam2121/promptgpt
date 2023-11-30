import Button from "@/components/Button/Button";
import Image from "next/image";
import Link from "next/link";
import styles from "./Subdomain.module.scss";
import { ChangeEvent, useState } from "react";

type SubdomainProps = {
  name?: string;
  description?: string;
  prompt?: string;
  key?: string;
};

const Subdomain: React.FC<SubdomainProps> = ({
  name,
  description,
  prompt,
  key,
}) => {
  const [copyButtonVisible, setCopyButtonVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "system",
      content: prompt,
    },
  ]);

  const [output, setOutput] = useState<string>("");
  const [userMessage, setUserMessage] = useState("");

  const handleCopy = () => {
    const textToCopy = output;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
      });
  };

  const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(event.target.value);
  };

  const handleSubmit = () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage },
    ]);
    setLoading(true);
    chatData(userMessage);
  };

  const chatData = async (userMessage: string) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [...messages, { role: "user", content: userMessage }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Chat API request failed");
      }

      const responseData = await response.json();
      if (responseData.choices && responseData.choices.length > 0) {
        const assistantMessage = responseData.choices[0]?.message;
        if (assistantMessage && assistantMessage.content) {
          setOutput(assistantMessage.content);
        }
      } else {
        console.error("Invalid responseData structure:", responseData);
      }
    } catch (error) {
      console.error("Error while fetching chat data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Link href="/" className={styles.logo}>
        <Image src="images/logo.svg" width={178} height={22.3} alt="logo" />
      </Link>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        <div className={styles["input-output"]}>
          <textarea
            className={styles.textarea}
            id="input"
            placeholder="Please write input here to get your desired output."
            name="input"
            onChange={handleTextAreaChange}
          />

          <Image
            src="images/line.svg"
            width={48}
            height={551}
            alt="line-svg"
            className={styles.img}
          />
          <div
            className={styles.textarea}
            onMouseEnter={() => setCopyButtonVisible(true)}
            onMouseLeave={() => setCopyButtonVisible(false)}
          >
            {output}{" "}
            <button
              className={styles["copy-btn"]}
              onClick={handleCopy}
              style={{ display: copyButtonVisible ? "block" : "none" }}
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className={styles.action}>
          <Button
            onClick={handleSubmit}
            disabled={!userMessage.trim() || loading}
            loading={loading}
          />
        </div>
      </div>
      <button className={styles["deploy-btn"]}>
        <Image src="images/logoIcon.svg" width={24} height={24} alt="logo" />
        <span>Deploy your own GPT with PromptGPT</span>
        <Image
          src="images/arrow-right.svg"
          width={24}
          height={24}
          alt="arrow-right"
        />
      </button>
    </div>
  );
};

export default Subdomain;
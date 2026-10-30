import type { ReactNode } from "react";
import { MISTNET_LINKS } from "@/lib/links";
import { SERVER_LOCATIONS } from "@/data/servers";
import { FaqAccessibility } from "@/components/FaqAccessibility";

interface FAQItem {
  readonly question: string;
  readonly answer: ReactNode;
}

const questions: readonly FAQItem[] = [
  {
    question: "Обязательно ли пользоваться Telegram?",
    answer: (
      <>
        Нет. Для входа и управления подпиской используй <a href={MISTNET_LINKS.cabinet}>личный кабинет MISTNET</a>.
        Доступны способы входа через Email, Google, Яндекс, VK и Telegram. Сам мессенджер не обязателен.
      </>
    ),
  },
  {
    question: "Как активировать бесплатный тест?",
    answer: (
      <>
        Открой <a href={MISTNET_LINKS.cabinet}>личный кабинет</a> и войди удобным способом. На главной странице кабинета
        есть активация пробного периода на 3 дня. Telegram для этого не требуется.
      </>
    ),
  },
  {
    question: "Как купить START или TITAN?",
    answer: (
      <>
        Перейди на <a href={MISTNET_LINKS.quickPurchase}>страницу оформления подписки</a>. Там выбери START или TITAN,
        срок на 1, 2 или 3 месяца, укажи Email или Telegram username и доступный способ оплаты. На сайте MISTNET
        платёжные данные не вводятся — оформление проходит в кабинете.
      </>
    ),
  },
  {
    question: "Чем отличаются START и TITAN?",
    answer: (
      <>
        START включает 50 ГБ трафика и до 3 устройств. TITAN — 100 ГБ и до 5 устройств, а также дополнительные варианты
        подключения для более сложных сетевых условий. Подробные условия и итоговую стоимость проверь на странице оформления.
      </>
    ),
  },
  {
    question: "Какие локации доступны?",
    answer: (
      <>
        В интерфейсе MISTNET представлены{" "}
        {SERVER_LOCATIONS.map((location, index) => {
          const label = `${location.country} (${location.city})`;
          const separator = index === 0 ? "" : index === SERVER_LOCATIONS.length - 1 ? " и " : ", ";
          return `${separator}${label}`;
        })}.
        Доступность конкретной конфигурации отображается в личном кабинете.
      </>
    ),
  },
  {
    question: "Какие протоколы использует MISTNET?",
    answer: (
      <>
        MISTNET предлагает WireGuard, VLESS, XHTTP и Hysteria. Доступный протокол зависит от конфигурации,
        которую ты получаешь в личном кабинете, и совместимого приложения.
      </>
    ),
  },
  {
    question: "Работает ли обход ограничений у всех операторов?",
    answer: (
      <>
        Работа зависит от региона, сети оператора, маршрутизации и текущих ограничений. Дополнительные режимы TITAN
        предназначены для более сложных условий, но гарантировать одинаковый результат в каждой сети нельзя.
      </>
    ),
  },
  {
    question: "Что делать, если Telegram недоступен?",
    answer: (
      <>
        Используй <a href={MISTNET_LINKS.cabinet}>личный кабинет</a>: там можно войти через Email или доступный внешний
        способ авторизации, активировать тест, купить подписку и управлять подключением. Telegram-бот остаётся альтернативой.
      </>
    ),
  },
  {
    question: "Где получить помощь?",
    answer: (
      <>
        Открой раздел поддержки в личном кабинете или напиши в{" "}
        <a href={MISTNET_LINKS.telegramSupport} target="_blank" rel="noopener noreferrer">
          Telegram-поддержку @mistnet_support
        </a>.
        Telegram — дополнительный канал связи.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <>
      <section className="container section" id="faq" aria-labelledby="faq-title">
        <h2 className="section-title reveal" id="faq-title">Частые вопросы</h2>
        <p className="section-subtitle reveal">
          Коротко о тарифах, локациях, подключении и работе без Telegram.
        </p>
        <div className="faq-container reveal">
          {questions.map((item, index) => {
            const questionId = `faq-question-${index + 1}`;
            const answerId = `faq-answer-${index + 1}`;

            return (
              <div className="faq-item" key={item.question}>
                <button
                  aria-controls={answerId}
                  aria-expanded="false"
                  className="faq-question"
                  id={questionId}
                  type="button"
                >
                  {item.question}
                  <span aria-hidden="true" className="faq-icon">+</span>
                </button>
                <div
                  aria-hidden="true"
                  aria-labelledby={questionId}
                  className="faq-answer"
                  id={answerId}
                  inert
                  role="region"
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <FaqAccessibility />
    </>
  );
}

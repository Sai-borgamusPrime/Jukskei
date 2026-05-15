import { useEffect, useState } from "react";
import { Info, X, ChevronLeft, ChevronRight } from "lucide-react";
import "./TournamentInfoButton.css";

const TOURNAMENT_MESSAGES = [
  {
    label: "President",
    title: "President",
    author: "Erik Strauss",
    role: "President, Namibië Jukskei",
    content: `Jukskei Familie,

Die Namibiëse Ope Jukskei Toernooi het oor die afgelope 25 jaar ontwikkel tot ’n gevestigde en gerespekteerde toernooi op die jukskei kalender. Hierdie mylpaal getuig van volgehoue toewyding, samewerking en die groeiende belangstelling in die sport.

Deur die jare het die toernooi nie net in omvang gegroei nie, maar ook in aansien. Dit dien as ’n platform waar spelers en spanne hulself kan meet en waar spanne van internasionale standaard saamkom. Die rol wat hierdie toernooi speel in die ontwikkeling en bevordering van jukskei kan nie onderskat word nie.

Ons spreek ons opregte waardering uit teenoor alle spelers en spanne wat oor die jare hul ondersteuning en deelname gelewer het. Julle betrokkenheid vorm die kern van die toernooi se sukses.

’n Spesiale woord van dank aan Jukskei Suid-Afrika (JSA), die besoekende Suid-Afrikaanse spanne, asook ons Namibiese spelers vir hul volgehoue ondersteuning en deelname. Sonder julle sou die voortbestaan en groei van die toernooi nie moontlik wees nie.

Die jaarlikse rotasie van die toernooi tussen streke dra by tot breër blootstelling en bied deelnemers die geleentheid om die unieke landskappe en gasvryheid van Namibië te ervaar. Dit versterk nie net sportbande nie, maar bevorder ook kulturele uitruiling en nasionale trots.

Namibië Jukskei bly verbind daar toe om die toernooi volhoubaar voort te sit en verder te ontwikkel. Alle belangstellendes word aangemoedig om deel te wees van hierdie dinamiese en groeiende sport geleentheid.

Ons vertrou dat hierdie toernooi nie net mededingend en suksesvol sal wees nie, maar ook ’n geleentheid sal bied vir netwerkvorming, samewerking en die bou van blywende verhoudings.

Geniet die toernooi!`,
  },
  {
    label: "Geskiedenis",
    title: "Namibia Ope Jukskei Toernooi 2001 - 2026",
    author: "Christie Horn",
    role: "",
    content: `Beste Jukskei Vriende

Dit is dan vir my ’n voorreg om ’n kort artikel te kan skryf oor die geskiedenis van die toernooi.

Weste Jukskei het van 1996 tot 2000 ’n 5 jaar ontwikkelings toernooi in Swakopmund aangebied. In 2000 is die program afgesluit met ’n Wereldkampioenskap waar daar dan twee Wereld Spanne gekies was.

Sentraal Jukskei het dan besluit om voort te gaan met nog ’n volgende 5 jaar ontwikkelings projek en voort te bou op die vorige 5 jaar van Weste jukskei.

Sentraal Jukskei het dan sodoende in 2001 die twee wereldspanne uitgenooi as die begin van hulle 5 jaar projek.

Die daarop volgende jaar nooi Sentraal Jukskei die senior nasionale spanne, naamlik die mans en dames span om te kom deelneem. Vir die eerste paar jaar word die nasionale spelers van JSA opgedeel in ons 4 ondersksie streek spanne naamlik Noorde, Weste, Suide en Sentraal. Die doel was om ons spelers te help met sekere fassette van die spel. Na ongeveer 5 jaar is daar besluit dat die nasionale spanne van JSA as spanne gaan deelneem teen spanne van ons streke. Intussen is die groep van JSA verder vergroot en het veterane by die groep aangesluit. Ander spanne van SA het ook begin deelneem aan die toernooi.

Metteryd het die spanne so vermeerder dat JSA met al hulle nasionale spanne begin deelneem het aan die toernooi en ook ander spanne. Dit is die enigste toernooi waar spanne die geleentheid kry om teen die nasionale spanne van SA deel te neem en dit opsig self maak die toernooi baie aaanloklik.

Die toernooi het so stadig maar seker sy plek gevind op die jukskei kalender en nou is ons reeds by 25 jaar. Die eerste klompie jare het die toernooi onder die jurisdiksie van Sentraal geval, maar soos die toernooi gegroei het is dit later, soos nou, onder die vaandel van Namibia Jukskei. Die toernooi het eers net in Windhoek plaasgevind, maar is daar besluit om die toernooi te roteer en elke streek die geleentheid te bied om die toernooi plaaslik aan te bied.

Noodeloos om te sê dat ’n toernooi wat aanvanklik net 5 jaar sou plaasvind het nou sy 25 jare bestaan bereik, voorwaar ’n mylpaal.

Dit is lekker om betrokke kan wees by ’n toernooi wat sy wortels diep gegrond het in die jukskei anale en op Namibiese grond. Mag die toernooi vir nog baie jare op die jukskei kalender bly vir ons nalatingskap.`,
  },
];

function TournamentInfoButton() {
  const [open, setOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const totalMessages = TOURNAMENT_MESSAGES.length;
  const activeMessage = TOURNAMENT_MESSAGES[messageIndex];

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const goToPreviousMessage = () => {
    setMessageIndex((currentIndex) =>
      currentIndex === 0 ? totalMessages - 1 : currentIndex - 1,
    );
  };

  const goToNextMessage = () => {
    setMessageIndex((currentIndex) =>
      currentIndex === totalMessages - 1 ? 0 : currentIndex + 1,
    );
  };

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowLeft") {
        goToPreviousMessage();
      }

      if (event.key === "ArrowRight") {
        goToNextMessage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="tournament-info-button"
        onClick={openModal}
        aria-label="Open tournament information"
        title="Tournament information"
      >
        <Info size={22} strokeWidth={2.8} />
      </button>

      {open && activeMessage && (
        <div
          className="tournament-info-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tournament-info-title"
        >
          <div
            className="tournament-info-backdrop"
            onClick={closeModal}
            aria-hidden="true"
          />

          <section className="tournament-info-modal">
            <div className="tournament-info-modal-header">
              <div>
                <span className="tournament-info-pill">
                  {activeMessage.label}
                </span>

                <h2 id="tournament-info-title">{activeMessage.title}</h2>
              </div>

              <button
                type="button"
                className="tournament-info-close"
                onClick={closeModal}
                aria-label="Close information message"
              >
                <X size={22} strokeWidth={2.8} />
              </button>
            </div>

            <div className="tournament-info-carousel">
              <button
                type="button"
                className="tournament-info-arrow tournament-info-arrow-left"
                onClick={goToPreviousMessage}
                aria-label="Previous tournament message"
              >
                <ChevronLeft size={26} strokeWidth={3} />
              </button>

              <div className="tournament-info-carousel-viewport">
                <div
                  className="tournament-info-carousel-track"
                  style={{
                    transform: `translateX(-${messageIndex * 100}%)`,
                  }}
                >
                  {TOURNAMENT_MESSAGES.map((message, index) => (
                    <article
                      key={message.label}
                      className="tournament-info-slide"
                      aria-hidden={messageIndex !== index}
                    >
                      <div className="tournament-info-body">
                        {message.content
                          .split("\n")
                          .map((paragraph, pIndex) => {
                            const trimmed = paragraph.trim();

                            if (!trimmed) return null;

                            return (
                              <p key={`${message.label}-${pIndex}`}>
                                {trimmed}
                              </p>
                            );
                          })}

                        <div className="tournament-info-signature">
                          <strong>{message.author}</strong>
                          {message.role && <span>{message.role}</span>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="tournament-info-arrow tournament-info-arrow-right"
                onClick={goToNextMessage}
                aria-label="Next tournament message"
              >
                <ChevronRight size={26} strokeWidth={3} />
              </button>
            </div>

            <div className="tournament-info-carousel-footer">
              <span className="tournament-info-counter">
                {messageIndex + 1} / {totalMessages}
              </span>

              <div
                className="tournament-info-dots"
                aria-label="Tournament message navigation"
              >
                {TOURNAMENT_MESSAGES.map((message, index) => (
                  <button
                    key={message.label}
                    type="button"
                    className={`tournament-info-dot ${
                      messageIndex === index ? "is-active" : ""
                    }`}
                    onClick={() => setMessageIndex(index)}
                    aria-label={`Go to ${message.label} message`}
                    aria-current={messageIndex === index ? "true" : "false"}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default TournamentInfoButton;

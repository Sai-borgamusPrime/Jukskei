function MatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  homeLogo,
  awayLogo,
}) {
  return (
    <article className="match-card">
      <div className="match-card__top">
        <div className="team-block">
          <img src={homeLogo} alt={homeTeam} className="team-logo" />
          <p className="team-name">{homeTeam}</p>
        </div>

        <div className="score-block">
          <h3 className="score-text">
            {homeScore} - {awayScore}
          </h3>
          <span className="live-badge">{status}</span>
        </div>

        <div className="team-block">
          <img src={awayLogo} alt={awayTeam} className="team-logo" />
          <p className="team-name">{awayTeam}</p>
        </div>
      </div>

      <button className="watch-button">Watch</button>
    </article>
  );
}

export default MatchCard;
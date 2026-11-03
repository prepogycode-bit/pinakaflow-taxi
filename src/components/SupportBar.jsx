import Icon from './Icon.jsx'
import { site } from '../site.config.js'

export default function SupportBar() {
  return (
    <section className="section supportbar">
      <div className="wrap supportbar__inner">
        <div className="supportbar__left">
          <Icon name="support_agent" className="supportbar__icon" />
          <div>
            <div className="supportbar__title">Stuck on a client, a captcha or an activation?</div>
            <div className="supportbar__sub">
              A person answers, and they will ask for the network report the app already wrote for
              you.
            </div>
          </div>
        </div>
        <div className="supportbar__actions">
          <a className="btn btn--ghost btn--sm" href={`mailto:${site.supportEmail}`}>
            <Icon name="mail" />
            {site.supportEmail}
          </a>
          <a className="btn btn--primary btn--sm" href="#download">
            <Icon name="download" />
            {site.trialLive ? 'Try for free' : 'Download TAXI'}
          </a>
        </div>
      </div>
    </section>
  )
}

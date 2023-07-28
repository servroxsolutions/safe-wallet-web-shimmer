import type { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import packageJson from '../../../../package.json'
import ExternalLink from '../ExternalLink'
import MUILink from '@mui/material/Link'
import { IS_OFFICIAL_HOST } from '@/config/constants'

const footerPages = [
  AppRoutes.welcome,
  AppRoutes.settings.index,
  AppRoutes.imprint,
  AppRoutes.privacy,
  AppRoutes.cookie,
  AppRoutes.terms,
  AppRoutes.licenses,
]

const FooterLink = ({ children, href }: { children: ReactNode; href: string }): ReactElement => {
  return href ? (
    <Link href={href} passHref>
      <MUILink>{children}</MUILink>
    </Link>
  ) : (
    <MUILink>{children}</MUILink>
  )
}

const Footer = (): ReactElement | null => {
  const router = useRouter()

  if (!footerPages.some((path) => router.pathname.startsWith(path))) {
    return null
  }

  const getHref = (path: string): string => {
    return router.pathname === path ? '' : path
  }

  return (
    <footer className={css.container}>
      <ul>
        {IS_OFFICIAL_HOST ? (
          <>
            <li>
              <Typography variant="caption">&copy;2022–{new Date().getFullYear()} Core Contributors GmbH</Typography>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.terms)}>Terms</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.privacy)}>Privacy</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.licenses)}>Licenses</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.imprint)}>Imprint</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.cookie)}>Cookie policy</FooterLink>
            </li>
            <li>
              <FooterLink href={getHref(AppRoutes.settings.index)}>Preferences</FooterLink>
            </li>
          </>
        ) : (
          <li>
            {'Official distribution of Safe{Wallet} on'}
            <a target="_blank" href="https://shimmer.network/" style={{ color: '#00E0CA' }} rel="noreferrer">
              &nbsp;shimmer
            </a>
            {'.'}
          </li>
        )}

        <li>
          <ExternalLink href={`${packageJson.homepage}/releases/tag/v${packageJson.version}`}>
            v{packageJson.version}
          </ExternalLink>
        </li>
        <li style={{ textAlign: 'center' }}>
          {'Operated and maintained by'}
          <a target="_blank" href="https://servrox.solutions/" style={{ color: '#858585' }} rel="noreferrer">
            &nbsp;servrox solutions&nbsp;
          </a>
          {'on behalf of the'}
          <a target="_blank" href="https://iota.org/" style={{ color: '#0fc1b7' }} rel="noreferrer">
            &nbsp;IOTA Foundation
          </a>
          {'.'}
        </li>
      </ul>
    </footer>
  )
}

export default Footer

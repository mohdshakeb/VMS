import helmetIcon from '@/assets/safetyIcons/safetyHalmet.svg'
import gogglesIcon from '@/assets/safetyIcons/safetyGoggles.svg'
import vestIcon from '@/assets/safetyIcons/vest.svg'
import glovesIcon from '@/assets/safetyIcons/gloves.svg'
import maskIcon from '@/assets/safetyIcons/mask.svg'
import harnessIcon from '@/assets/safetyIcons/harness.svg'
import coverallIcon from '@/assets/safetyIcons/coverall.svg'

export interface PpeAsset {
  id: string
  label: string
  icon: string
  svg?: string
}

export const PPE_ASSETS: PpeAsset[] = [
  { id: 'helmet',     label: 'Safety Helmet',      icon: 'ri-hard-hat-line',     svg: helmetIcon   },
  { id: 'glasses',    label: 'Safety Glasses',      icon: 'ri-glasses-line',      svg: gogglesIcon  },
  { id: 'ear',        label: 'Ear Plugs / Muffs',   icon: 'ri-headphone-line'                       },
  { id: 'boots',      label: 'Safety Boots',        icon: 'ri-footprint-line'                       },
  { id: 'vest',       label: 'Hi-Vis Vest',         icon: 'ri-t-shirt-line',      svg: vestIcon     },
  { id: 'gloves',     label: 'Gloves',              icon: 'ri-hand-line',         svg: glovesIcon   },
  { id: 'respirator', label: 'Respirator / Mask',   icon: 'ri-mask-line',         svg: maskIcon     },
  { id: 'harness',    label: 'Safety Harness',      icon: 'ri-anchor-line',       svg: harnessIcon  },
  { id: 'face-shield',label: 'Face Shield',         icon: 'ri-shield-line'                          },
  { id: 'coveralls',  label: 'Coveralls',           icon: 'ri-user-clothes-line', svg: coverallIcon },
  { id: 'other',      label: 'Other',               icon: 'ri-more-line'                            },
]

const PPE_BY_LABEL = Object.fromEntries(PPE_ASSETS.map((a) => [a.label, a]))

/** Parse the comma-separated assetsIssued string back into structured asset objects. */
export function parseIssuedAssets(assetsIssued: string | undefined): PpeAsset[] {
  if (!assetsIssued || assetsIssued === 'Yes') return []
  return assetsIssued.split(', ').map((label) => {
    if (PPE_BY_LABEL[label]) return PPE_BY_LABEL[label]
    return { id: label, label, icon: 'ri-more-line' }
  })
}

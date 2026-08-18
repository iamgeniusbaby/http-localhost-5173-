import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

export const EARTH_RADIUS = 2
const EARTH_TEXTURE_URL =
  'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'

export default function Earth() {
  const texture = useLoader(TextureLoader, EARTH_TEXTURE_URL)

  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
    </mesh>
  )
}

export { EARTH_TEXTURE_URL }

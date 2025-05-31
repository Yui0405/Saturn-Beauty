"use client"

import type React from "react"
import Image from "next/image"

// Datos del equipo
const teamMembers = [
  {
    id: 1,
    name: "María López",
    position: "Fundadora y CEO",
    bio: "Con más de 15 años de experiencia en la industria cosmética, María fundó Saturn Beauty con la visión de crear productos naturales y sostenibles.",
    image: "/about-us/Maria.webp",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    position: "Director de Investigación y Desarrollo",
    bio: "Doctor en Química Cosmética, Carlos lidera nuestro equipo de investigación para desarrollar fórmulas innovadoras con ingredientes naturales.",
    image: "/about-us/Carlos.webp",
  },
  {
    id: 3,
    name: "Laura Sánchez",
    position: "Directora de Sostenibilidad",
    bio: "Especialista en prácticas sostenibles, Laura se asegura de que todos nuestros productos y procesos sean respetuosos con el medio ambiente.",
    image: "/about-us/Laura.jpg",
  },
  {
    id: 4,
    name: "Javier Martín",
    position: "Director Creativo",
    bio: "Con su ojo para el diseño y la estética, Javier es responsable de la imagen de marca y el diseño de producto de Saturn Beauty.",
    image: "/about-us/Javier.jpg",
  },
]

export default function AboutUs() {

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-mint-green-dark font-playfair">Nuestra Historia</h2>
          <p className="text-gray-600 mb-4">
            En Saturn Beauty, creemos que la belleza no se trata de cubrir quién eres, sino de celebrar lo que te hace
            único. Nuestra misión es ofrecer productos de calidad que realcen tu belleza natural y te permitan
            expresarte con confianza.
          </p>
          <p className="text-gray-600 mb-4">
            Fundada en 2020, nuestra marca nació de la pasión por crear cosméticos que combinan lo mejor de la
            naturaleza con la ciencia moderna. Todos nuestros productos están formulados con ingredientes naturales de
            alta calidad, libres de químicos agresivos y nunca testados en animales.
          </p>
          <p className="text-gray-600">
            Nos enorgullece ofrecer una línea de productos que no solo te hacen lucir bien, sino que también son buenos
            para tu piel y para el planeta.
          </p>
        </div>
        <div className="relative h-80 rounded-lg overflow-hidden">
          <Image src="/about-us/about1.webp" alt="Productos de belleza naturales" fill className="object-cover" />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-mint-green-dark font-playfair">Nuestros Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-mint-green-light p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2 text-mint-green-dark">Belleza Natural</h3>
            <p className="text-gray-600">
              Creemos en realzar tu belleza natural, no en ocultarla. Nuestros productos están diseñados para
              complementar tus rasgos únicos.
            </p>
          </div>
          <div className="bg-mint-green-light p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2 text-mint-green-dark">Sostenibilidad</h3>
            <p className="text-gray-600">
              Nos comprometemos a minimizar nuestro impacto ambiental mediante prácticas sostenibles y envases
              eco-amigables.
            </p>
          </div>
          <div className="bg-mint-green-light p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2 text-mint-green-dark">Inclusión</h3>
            <p className="text-gray-600">
              La belleza no tiene un solo aspecto. Celebramos la diversidad y creamos productos para todos los tonos de
              piel, identidades y estilos.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-mint-green-dark font-playfair">Nuestro Equipo</h2>
        <p className="text-gray-600 mb-8 text-center">
          Conoce a las personas apasionadas detrás de Saturn Beauty que trabajan día a día para ofrecerte los mejores
          productos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-mint-green-light rounded-lg overflow-hidden">
              <div className="relative h-64">
                <Image src={member.image} alt={member.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-mint-green-dark">{member.name}</h3>
                <p className="text-mint-green font-medium mb-2">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-mint-green-dark font-playfair">Nuestro Compromiso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 rounded-lg overflow-hidden">
            <Image
              src="/about-us/about2.webp"
              alt="Compromiso con la sostenibilidad"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-gray-600 mb-4">
              En Saturn Beauty, la calidad es nuestra prioridad. Cada producto pasa por rigurosos controles para
              garantizar que cumple con nuestros altos estándares.
            </p>
            <p className="text-gray-600 mb-4">Nos comprometemos a:</p>
            <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-2">
              <li>Utilizar ingredientes naturales y orgánicos siempre que sea posible</li>
              <li>No realizar pruebas en animales</li>
              <li>Reducir nuestro impacto ambiental con envases reciclables</li>
              <li>Apoyar causas sociales que promueven la autoestima y el bienestar</li>
            </ul>
            <p className="text-gray-600">
              Porque creemos que la verdadera belleza viene de sentirse bien con uno mismo y con el mundo que nos rodea.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

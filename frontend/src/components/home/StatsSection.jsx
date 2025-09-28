import { motion } from 'framer-motion'
import { useRef } from 'react'

const StatsSection = ({ stats }) => {
  const ref = useRef(null)

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform is making a real difference in the food supply chain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-10 h-10 text-primary-600" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
              </div>
              
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="text-4xl font-bold text-gray-900 mb-2"
              >
                {stat.value}
              </motion.div>
              
              <div className="text-lg text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection

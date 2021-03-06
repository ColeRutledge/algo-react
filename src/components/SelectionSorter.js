import React, { useState, useContext, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { motion } from 'framer-motion'

import DataContext from '../contexts/DataContext'
import ControlWidget from './ControlWidget'
import AlgoInfo from './AlgoInfo'
import SortNode from './SortNode'
import { SortContainer } from '../styles'

const SelectionSorter = () => {
  const { data, metrics, setMetrics, isRunning, setIsRunning  } = useContext(DataContext)
  const [ sortedData, setSortedData ] = useState([])
  const refContainer = useRef(isRunning)
  const history = useHistory()

  const selection = {...metrics.selection}

  useEffect(() => setSortedData(data), [data])
  useEffect(() => {
    refContainer.current = isRunning
  }, [isRunning])

  useEffect(() => {
    return history.listen(() => {
      if (isRunning) setMetrics({ ...metrics, selection: { access: 0, swaps: 0 } })
      refContainer.current = false
      setIsRunning(false)
    })
  }, [history, setIsRunning, isRunning, metrics, setMetrics])

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const selectionSort = async () => {
    setIsRunning(true)
    await sleep(5)
    const copy = data.slice()
    selection.access = 0
    selection.swaps = 0

    for (let i = 0; i < copy.length; i++) {
      if (!refContainer.current) return
      let smallest = i
      selection.access++
      setMetrics({ ...metrics, selection })
      for (let j = i + 1; j < copy.length; j++) {
        if (!refContainer.current) return
        selection.access++
        if (copy[smallest] > copy[j]) {
          smallest = j
        }
      }
      if (smallest !== i) {
        const swapped = await swap(i, smallest, copy)
        selection.swaps++
        if (!refContainer.current) return
        setMetrics({ ...metrics, selection })
        setSortedData([...swapped])
      }
    }
    refContainer.current = false
    setIsRunning(false)
  }

  const swap = async (firstIndx, secondIndx, array) => {
    const bars = document.getElementsByClassName('bar')
    bars[firstIndx].style.backgroundColor = '#DC3545'
    bars[secondIndx].style.backgroundColor = '#DC3545'
    let temp = array[firstIndx]
    array[firstIndx] = array[secondIndx]
    array[secondIndx] = temp
    await sleep(30)
    bars[firstIndx].style.backgroundColor = '#02203c'
    bars[secondIndx].style.backgroundColor = '#02203c'
    return array
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}><ControlWidget algo={selectionSort} /></motion.div>
      <SortContainer initial={{ x: '40vw' }} animate={{ x: 0 }} transition={{ duration: 1, type: 'spring', stiffness: 40, }}>
        {sortedData.map((value, index) => <SortNode key={index} value={value} />)}
      </SortContainer>
      <AlgoInfo info={info} />
    </motion.div>
  )
}

export default SelectionSorter


const info = {
  timeBigO: '$\\mathcal O(n^2)$',
  spaceBigO: '$\\mathcal O(1)$',
  time: 'Selection Sort is thought to be only slighty more efficient than Bubble Sort but still a less efficient algorithm.  Both the outer and inner loops contribute $\\mathcal O(n)$ but the inner loop iterates one less time for each iteration of the outer loop with a total time complexity of $\\mathcal{O}(n\\cdot\\ n) = \\mathcal O(n^2)$.',
  space: 'Selection Sort\'s space complexity is as efficient as it can get at $\\mathcal O(1)$.  The amount of memory consumed does not increase relative to the size of the input array as we\'re \'swapping\' elements and mutating the original array.',
}

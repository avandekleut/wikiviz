import { useEffect, useRef } from 'react'

type Task = () => void

type Queue = {
  enqueue: (task: Task) => void
}

const useQueue = ({ delay }: { delay: number }): Queue => {
  const tasksRef = useRef<Task[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      if (tasksRef.current.length > 0) {
        const [task, ...rest] = tasksRef.current
        task()
        tasksRef.current = rest
      }
    }, delay)

    return () => clearInterval(timer)
  }, [delay])

  const enqueue = (task: Task) => {
    console.log({ msg: 'enqueuing', numTasks: tasksRef.current.length })
    tasksRef.current = [...tasksRef.current, task]
  }

  return { enqueue }
}

export default useQueue

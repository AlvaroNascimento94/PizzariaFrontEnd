'use client'

import { useState } from 'react'
import { OrderData } from '@/types/types'
import styles from './cardCozinha.module.scss'
import { api } from '@/services/api'
import { getCookieCliente } from '@/lib/cookieClient'
import { Play } from 'lucide-react'

interface CardCozinhaProps {
    order: OrderData
    onUpdate: () => void
}

export function CardCozinha({ order, onUpdate }: CardCozinhaProps) {
    const [loading, setLoading] = useState(false)

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'Iniciado':
                return { name: 'Em Preparo', buttonText: 'Iniciar Preparo', color: 'orange' }

            case 'Em Preparo':
                return { name: 'Pronto', buttonText: 'Pronto', color: 'oliva' }
            case 'Pronto':
                return { name: 'Em Entrega', buttonText: 'Entregar', color: 'bordo' }
            default:
                return null
        }
    }

    const nextStatus = getNextStatus(order.orderStatus.name)

    const getTimeAgo = (date: string) => {
        const now = new Date()
        const orderDate = new Date(date)
        const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60))

        if (diffInMinutes < 60) {
            return `${diffInMinutes} min atrás`
        }
        const diffInHours = Math.floor(diffInMinutes / 60)
        return `${diffInHours}h ${diffInMinutes % 60}min atrás`
    }


    const handleUpdateStatus = async () => {
        if (!nextStatus) return

        setLoading(true)
        try {
            const token = getCookieCliente()

            await api.put('/order/status',
                {
                    orderId: order.id,
                    statusName: nextStatus.name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            onUpdate()
        } catch (error: any) {
            console.error('Erro ao atualizar status:', error)
            const errorMessage = error.response?.data?.error || 'Erro ao atualizar status do pedido'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2 className={styles.mesa}>{order.tables.name}</h2>
                <span className={styles.waiter}>Garçom: {order.waiter.name}</span>
            </div>

            <p className={styles.time}>Pedido: {getTimeAgo(order.createdAt)}</p>

            <div className={styles.items}>
                {order.orderProducts && order.orderProducts.length > 0 ? (
                    order.orderProducts.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <span className={styles.amount}>{item.quantity}x</span>
                            <span className={styles.productName}>{item.product.name}</span>
                            {item.description && (
                                <span className={styles.description}>{item.description}</span>
                            )} 
                        </div>
                    ))
                ) : (
                    <p className={styles.noItems}>Nenhum item no pedido</p>
                )}
            </div>

            {nextStatus && (
                <button
                    className={`${styles.button} ${styles[nextStatus.color]}`}
                    onClick={handleUpdateStatus}
                    disabled={loading}
                >
                    <Play size={20} />
                    {loading ? 'Atualizando...' : nextStatus.buttonText}
                </button>
            )}
        </div>
    )
}

import React from 'react'
import Head from 'next/head'
import { BureaucraticMountainsGame } from '@/components/BureaucraticMountainsGame'

export default function Home() {
    return (
        <>
            <Head>
                <title>Bureaucratic Mountains and Valleys of Death</title>
                <meta name="description" content="A satirical defense acquisition board game where program managers navigate the treacherous terrain of military procurement" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <BureaucraticMountainsGame />
        </>
    )
} 
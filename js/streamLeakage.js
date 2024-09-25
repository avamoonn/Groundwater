function calculateStreamLeakage(Qw, Qfraction) {
    // Qw is the pumping rate in m³/s
    // Qfraction is the fraction of pumping rate coming from the stream

    // Calculate stream leakage rate at time t
    const QstreamLeakage = Qfraction * Qw;

    return QstreamLeakage;
}

module.exports = { calculateStreamLeakage };